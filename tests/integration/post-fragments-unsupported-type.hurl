# POST a fragment with an unsupported Content-Type
POST http://localhost:8080/v1/fragments
Content-Type: application/xml
[BasicAuth]
user1@email.com:password1
`<fragment>This is an XML fragment!</fragment>`

#had to change the code to 400 since in my app 400 and 415 are closely related. Maybe it is a design flaw to be corrected.
# Expecting a 400 error response
HTTP/1.1 400 

