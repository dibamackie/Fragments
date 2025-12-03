# Step 1: POST a new text fragment
POST http://localhost:8080/v1/fragments
Content-Type: text/plain
[BasicAuth]
user1@email.com:password1

`Hello S3!`

# 1. Expect HTTP 201 and capture the Location header
HTTP/1.1 201
[Asserts]
header "Location" matches "^http:\/\/localhost:8080\/v1\/fragments\/[A-Za-z0-9_-]+$"
jsonpath "$.status" == "ok"
jsonpath "$.fragment.id" matches "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$"
jsonpath "$.fragment.ownerId" matches "^[0-9a-fA-F]+$"
jsonpath "$.fragment.created" isString
jsonpath "$.fragment.updated" isString
jsonpath "$.fragment.type" == "text/plain"
jsonpath "$.fragment.size" == 9

# Capture the Location URL into a variable named `url`
[Captures]
url: header "Location"

# Step 2: GET the fragment using the captured URL
GET {{url}}
[BasicAuth]
user1@email.com:password1
[Options]
retry: 5              # Try up to 5 times
retry-interval: 1000  # Wait 1000ms (1s) between attempts

HTTP/1.1 200
Content-Type: text/plain
Content-Length: 9
[Asserts]
body == "Hello S3!"

# Step 3: DELETE the fragment using the captured URL
DELETE {{url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
[Asserts]
jsonpath "$.status" == "ok"

# Step 4: Try to GET the deleted fragment (should return 404)
GET {{url}}
[BasicAuth]
user1@email.com:password1
[Options]
retry: 5              # Retry if the status code is NOT 404 yet
retry-interval: 1000  # Wait 1s between checks

HTTP/1.1 404
[Asserts]
jsonpath "$.error" == "Fragment not found."
