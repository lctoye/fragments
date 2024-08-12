# Create fragment

POST http://localhost:8080/v1/fragments
Content-Type: image/png
[BasicAuth]
user1@email.com:password1
file,test.png;

HTTP/1.1 201
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.type" == "image/png"
[Captures]
url: header "Location"
id: jsonpath "$.fragment.id"

# Get fragment

GET {{url}}/info
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.type" == "image/png"
jsonpath "$.fragment.id" == "{{id}}"

# Get image fragment as jpg

GET {{url}}.jpg
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200


# Get image fragment as txt

GET {{url}}.txt
[BasicAuth]
user1@email.com:password1

HTTP/1.1 415
[Asserts]
jsonpath "$.status" == "error"
jsonpath "$.error.code" == 415


