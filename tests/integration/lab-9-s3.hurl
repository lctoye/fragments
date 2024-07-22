# POST a new text fragment to http://localhost:8080 as an authorized user. The fragment's body should be the string, `Hello S3!`.
# Confirm that the server returns a 201, and capture the Location header value to a variable named url
POST http://localhost:8080/v1/fragments
Content-Type: text/plain
[BasicAuth]
user1@email.com:password1
`Hello S3!`

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
[Captures]
url: header "Location"

# GET the fragment you just created using the url as an authorized user.
# Confirm that the server returns a 200, that the type of the fragment is text/plain, and that the body is equal to Hello S3!
GET {{url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
Content-Type: text/plain
Content-Length: 9
[Asserts]
body == "Hello S3!"

# DELETE the fragment using the url as an authorized user.

DELETE {{url}}
[BasicAuth]
user1@email.com:password1

# Confirm that the server returns a 200.

HTTP/1.1 200
[Asserts]
jsonpath "$.status" == "ok"

# Try to GET the fragment again using the url as an authorized user.

GET {{url}}
[BasicAuth]
user1@email.com:password1

# Confirm that the server returns a 404, since the fragment should be deleted.

HTTP/1.1 404
[Asserts]
jsonpath "$.status" == "error"
jsonpath "$.error.code" == 404