# POST a JSON fragment
POST http://localhost:8080/v1/fragments
Content-Type: text/plain; charset=utf-8
[BasicAuth]
user1@email.com:password1
`This is a fragment!`

# Expecting a 201 Created response
HTTP/1.1 201 

# Assert the fragment details and Location header
[Asserts]
header "Location" matches "^http:\/\/localhost:8080\/v1\/fragments\/[A-Za-z0-9_-]+$"
jsonpath "$.status" == "ok"
jsonpath "$.fragment.type" == "text/plain; charset=utf-8"
jsonpath "$.fragment.ownerId" matches "^[0-9a-fA-F]+$"
jsonpath "$.fragment.size" == 19

# Capture the Location URL into a variable
[Captures]
url: header "Location"

# 2. Try to GET the JSON fragment by its URL
GET {{url}}
[BasicAuth]
user1@email.com:password1

# Expecting a 200 OK and the same JSON fragment data
HTTP/1.1 200 
Content-Type: text/plain; charset=utf-8
Content-Length: 19
[Asserts]
body == "This is a fragment!"
