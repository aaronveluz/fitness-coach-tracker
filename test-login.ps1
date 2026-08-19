$body = '{"email":"admin@example.com","password":"Admin@1234"}';
$r = Invoke-WebRequest -Uri 'http://localhost:4000/api/v1/auth/login' -Method POST -ContentType 'application/json' -Body $body;
Write-Host "STATUS:" $r.StatusCode;
Write-Host "BODY:" $r.Content;
