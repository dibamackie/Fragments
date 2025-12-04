# Create a new fragment with text/plain
POST http://localhost:8080/v1/fragments
Content-Type: text/plain
[BasicAuth]
user1@email.com:password1
`This is the original fragment text`

HTTP/1.1 201
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.id" != ""

# Extract fragment ID from the POST response
[Captures]
fragmentId: jsonpath "$.fragment.id"

# Update the same fragment with new content using PUT
PUT http://localhost:8080/v1/fragments/{{fragmentId}}
Content-Type: text/plain
[BasicAuth]
user1@email.com:password1
`This is the updated fragment content`

HTTP/1.1 200
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.size" == 36
jsonpath "$.fragment.id" == "{{fragmentId}}"

# Get the fragment data to verify the update
GET http://localhost:8080/v1/fragments/{{fragmentId}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
[Asserts]
body == "This is the updated fragment content"
