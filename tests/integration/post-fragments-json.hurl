# POST a JSON fragment
POST http://localhost:8080/v1/fragments
Content-Type: application/json
[BasicAuth]
user1@email.com:password1
{
    "body": "This is a fragment!"
}

# Expecting a 201 Created response
HTTP/1.1 201

# Assert the fragment details and Location header
[Asserts]
header "Location" matches "^http:\/\/localhost:8080\/v1\/fragments\/[A-Za-z0-9_-]+$"
jsonpath "$.status" == "ok"
jsonpath "$.fragment.type" == "application/json"

# Capture the Location URL into a variable
[Captures]
url: header "Location"

# 2. Try to GET the JSON fragment by its URL
GET {{url}}
[BasicAuth]
user1@email.com:password1


# Expecting a 200 OK and the same JSON fragment data
HTTP/1.1 200
Content-Type: application/json
[Asserts]

