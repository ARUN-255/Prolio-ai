#!/usr/bin/env bash
set -euo pipefail

API="http://127.0.0.1:5000/api"
JSON_HEADER='Content-Type: application/json'

json_get() {
  node -e 'const x=JSON.parse(process.argv[1]); const parts=process.argv[2].split("."); let v=x; for(const p of parts){ v=v?.[p]; } if(v===undefined||v===null) process.exit(1); process.stdout.write(String(v));' "$1" "$2"
}

assert_json() {
  node -e 'const x=JSON.parse(process.argv[1]); const ok=Function("x", `return (${process.argv[2]})`)(x); if(!ok){ console.error(JSON.stringify(x,null,2)); process.exit(1); }' "$1" "$2"
}

echo "[1/12] Register student and recruiter"
STUDENT=$(curl --fail --silent -X POST "$API/auth/register" -H "$JSON_HEADER" \
  -d '{"name":"CI Student","email":"student-ci@prolio.test","password":"TestPass123!","role":"student"}')
RECRUITER=$(curl --fail --silent -X POST "$API/auth/register" -H "$JSON_HEADER" \
  -d '{"name":"CI Recruiter","email":"recruiter-ci@prolio.test","password":"TestPass123!","role":"recruiter"}')
STUDENT_TOKEN=$(json_get "$STUDENT" token)
RECRUITER_TOKEN=$(json_get "$RECRUITER" token)

assert_json "$STUDENT" 'x.user?.role === "student"'
assert_json "$RECRUITER" 'x.user?.role === "recruiter"'

echo "[2/12] Verify role authorization"
STATUS=$(curl --silent -o /tmp/role-student.json -w '%{http_code}' "$API/recruiter/jobs" -H "Authorization: Bearer $STUDENT_TOKEN")
[ "$STATUS" = "403" ] || { cat /tmp/role-student.json; echo "Expected student->recruiter 403, got $STATUS"; exit 1; }
STATUS=$(curl --silent -o /tmp/role-recruiter.json -w '%{http_code}' "$API/students/portfolio" -H "Authorization: Bearer $RECRUITER_TOKEN")
[ "$STATUS" = "403" ] || { cat /tmp/role-recruiter.json; echo "Expected recruiter->student 403, got $STATUS"; exit 1; }

echo "[3/12] Build student public profile"
PROFILE=$(curl --fail --silent -X POST "$API/students/portfolio" \
  -H "Authorization: Bearer $STUDENT_TOKEN" -H "$JSON_HEADER" \
  -d '{"headline":"Full Stack Developer","bio":"CI public profile","location":"Tamil Nadu, India","website":"https://example.com","github":"https://github.com/example","isPublic":true}')
assert_json "$PROFILE" 'x.success === true'

SKILL=$(curl --fail --silent -X POST "$API/students/portfolio/skills" \
  -H "Authorization: Bearer $STUDENT_TOKEN" -H "$JSON_HEADER" \
  -d '{"name":"React","category":"Frontend","proficiency":"Intermediate","is_public":true}')
assert_json "$SKILL" 'x.success === true'

PROJECT=$(curl --fail --silent -X POST "$API/students/portfolio/projects" \
  -H "Authorization: Bearer $STUDENT_TOKEN" -H "$JSON_HEADER" \
  -d '{"title":"CI Portfolio Project","description":"React Node Express PostgreSQL application","tech_stack":["React","Node.js","PostgreSQL"],"link":"https://example.com/project","is_public":true}')
PROJECT_ID=$(json_get "$PROJECT" project.id)

EDU=$(curl --fail --silent -X POST "$API/students/portfolio/education" \
  -H "Authorization: Bearer $STUDENT_TOKEN" -H "$JSON_HEADER" \
  -d '{"institution":"CI University","degree":"B.Tech IT","field_of_study":"Information Technology","start_year":2024,"end_year":2028,"is_public":true}')
assert_json "$EDU" 'x.success === true'

echo "[4/12] Create public resumes and run ATS"
RESUME_A=$(curl --fail --silent -X POST "$API/students/resumes" \
  -H "Authorization: Bearer $STUDENT_TOKEN" -H "$JSON_HEADER" \
  -d '{"title":"CI Resume A","template_name":"classic","resume_data":{"personal_info":{"name":"CI Student"},"skills":["React","Node.js","PostgreSQL"],"projects":[{"title":"Project A"}],"experience":[],"education":[{"degree":"B.Tech IT"}]},"is_primary":true,"is_public":true}')
RESUME_A_ID=$(json_get "$RESUME_A" resume.id)

RESUME_B=$(curl --fail --silent -X POST "$API/students/resumes" \
  -H "Authorization: Bearer $STUDENT_TOKEN" -H "$JSON_HEADER" \
  -d '{"title":"CI Resume B","template_name":"classic","resume_data":{"personal_info":{"name":"CI Student"},"skills":["Java","SQL"],"projects":[],"experience":[],"education":[{"degree":"B.Tech IT"}]},"is_primary":false,"is_public":true}')
RESUME_B_ID=$(json_get "$RESUME_B" resume.id)

ATS=$(curl --fail --silent -X POST "$API/students/ats/analyze" \
  -H "Authorization: Bearer $STUDENT_TOKEN" -H "$JSON_HEADER" \
  -d "{\"resume_id\":$RESUME_A_ID,\"job_title\":\"Full Stack Developer\",\"job_description\":\"Looking for React Node.js PostgreSQL REST API JavaScript developer\"}")
assert_json "$ATS" 'x.success === true && Number.isFinite(Number(x.analysis?.ats_score))'

echo "[5/12] Recruiter candidate search and candidate detail"
CANDIDATES=$(curl --fail --silent "$API/recruiter/candidates/search" -H "Authorization: Bearer $RECRUITER_TOKEN")
assert_json "$CANDIDATES" 'x.success === true && x.candidates?.length === 1'
CANDIDATE_ID=$(json_get "$CANDIDATES" candidates.0.id)
CANDIDATE_SLUG=$(json_get "$CANDIDATES" candidates.0.public_slug)
DETAIL=$(curl --fail --silent "$API/recruiter/candidates/$CANDIDATE_SLUG" -H "Authorization: Bearer $RECRUITER_TOKEN")
assert_json "$DETAIL" 'x.success === true && x.candidate?.user?.name === "CI Student" && x.candidate?.resumes?.length === 2'

echo "[6/12] Public portfolio and public resume discovery"
PUBLIC=$(curl --fail --silent "$API/public/profile/$CANDIDATE_SLUG")
assert_json "$PUBLIC" 'x.success === true && x.portfolio?.user?.name === "CI Student" && x.portfolio?.projects?.length === 1'
PUBLIC_RESUMES=$(curl --fail --silent "$API/recruiter/resumes/public" -H "Authorization: Bearer $RECRUITER_TOKEN")
assert_json "$PUBLIC_RESUMES" 'x.success === true && x.resumes?.length === 2'

echo "[7/12] Resume comparison"
COMPARE=$(curl --fail --silent -X POST "$API/recruiter/resumes/compare" \
  -H "Authorization: Bearer $RECRUITER_TOKEN" -H "$JSON_HEADER" \
  -d "{\"resume_a_id\":$RESUME_A_ID,\"resume_b_id\":$RESUME_B_ID,\"required_skills\":[\"React\",\"Node.js\",\"PostgreSQL\"],\"job_title\":\"Full Stack Developer\",\"job_description\":\"Build web applications\"}")
assert_json "$COMPARE" 'x.success === true && x.comparison?.resume_a?.job_match_percentage === 100 && x.comparison?.higher_score === "resume_a"'

echo "[8/12] Project analyzer"
ANALYZE=$(curl --fail --silent -X POST "$API/recruiter/projects/$PROJECT_ID/analyze" \
  -H "Authorization: Bearer $RECRUITER_TOKEN" -H "$JSON_HEADER" \
  -d '{"required_skills":["React","Node.js"],"job_title":"Full Stack Developer","job_description":"React and Node.js role"}')
assert_json "$ANALYZE" 'x.success === true && x.analysis != null'

echo "[9/12] Recruiter jobs CRUD"
JOB=$(curl --fail --silent -X POST "$API/recruiter/jobs" \
  -H "Authorization: Bearer $RECRUITER_TOKEN" -H "$JSON_HEADER" \
  -d '{"title":"Software Engineer Intern","company":"Prolio CI","location":"Chennai","employment_type":"Internship","description":"Build and test full stack features","required_skills":["React","Node.js"],"status":"active"}')
JOB_ID=$(json_get "$JOB" job.id)

JOBS=$(curl --fail --silent "$API/recruiter/jobs" -H "Authorization: Bearer $RECRUITER_TOKEN")
assert_json "$JOBS" 'x.success === true && x.count === 1'
UPDATED_JOB=$(curl --fail --silent -X PUT "$API/recruiter/jobs/$JOB_ID" \
  -H "Authorization: Bearer $RECRUITER_TOKEN" -H "$JSON_HEADER" \
  -d '{"status":"closed"}')
assert_json "$UPDATED_JOB" 'x.success === true && x.job?.status === "closed"'

echo "[10/12] Recruiter invitations including duplicate protection"
INVITE=$(curl --fail --silent -X POST "$API/recruiter/invitations" \
  -H "Authorization: Bearer $RECRUITER_TOKEN" -H "$JSON_HEADER" \
  -d "{\"candidate_id\":$CANDIDATE_ID,\"job_id\":$JOB_ID,\"message\":\"We would like to discuss an opportunity with you.\"}")
assert_json "$INVITE" 'x.success === true && x.invitation?.id != null'
INVITES=$(curl --fail --silent "$API/recruiter/invitations" -H "Authorization: Bearer $RECRUITER_TOKEN")
assert_json "$INVITES" 'x.success === true && x.count === 1 && x.invitations?.[0]?.candidate_name === "CI Student"'
DUP_STATUS=$(curl --silent -o /tmp/duplicate-invite.json -w '%{http_code}' -X POST "$API/recruiter/invitations" \
  -H "Authorization: Bearer $RECRUITER_TOKEN" -H "$JSON_HEADER" \
  -d "{\"candidate_id\":$CANDIDATE_ID,\"job_id\":$JOB_ID,\"message\":\"Duplicate\"}")
[ "$DUP_STATUS" = "409" ] || { cat /tmp/duplicate-invite.json; echo "Expected duplicate invitation 409, got $DUP_STATUS"; exit 1; }

echo "[11/12] Billing plans and subscriptions"
PLANS=$(curl --fail --silent "$API/billing/plans")
assert_json "$PLANS" 'Array.isArray(x.plans) && x.plans.length === 5'
STUDENT_SUB=$(curl --fail --silent "$API/billing/subscription" -H "Authorization: Bearer $STUDENT_TOKEN")
RECRUITER_SUB=$(curl --fail --silent "$API/billing/subscription" -H "Authorization: Bearer $RECRUITER_TOKEN")
assert_json "$STUDENT_SUB" 'x.subscription?.plan_name === "Student Free"'
assert_json "$RECRUITER_SUB" 'x.subscription?.plan_name === "Recruiter Free"'

echo "[12/12] Cleanup recruiter job and verify deletion"
DELETE_JOB=$(curl --fail --silent -X DELETE "$API/recruiter/jobs/$JOB_ID" -H "Authorization: Bearer $RECRUITER_TOKEN")
assert_json "$DELETE_JOB" 'x.success === true'
JOBS_AFTER=$(curl --fail --silent "$API/recruiter/jobs" -H "Authorization: Bearer $RECRUITER_TOKEN")
assert_json "$JOBS_AFTER" 'x.success === true && x.count === 0'

echo "FULL SMOKE TEST PASSED"
