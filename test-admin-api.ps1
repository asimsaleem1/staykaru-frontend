# PowerShell script to test admin API endpoints
$baseUrl = "https://staykaru-backend-60ed08adb2a7.herokuapp.com"

Write-Host "🔍 Testing Admin Dashboard API Endpoints..." -ForegroundColor Green
Write-Host ""

# Define endpoints to test
$endpoints = @(
    @{Path = "/users/admin/all"; Description = "Get all users (Admin)"},
    @{Path = "/users/admin/count"; Description = "Get user count by role (Admin)"},
    @{Path = "/analytics/dashboard"; Description = "Get dashboard analytics"},
    @{Path = "/analytics/users"; Description = "Get user analytics"},
    @{Path = "/analytics/bookings"; Description = "Get booking analytics"},
    @{Path = "/analytics/orders"; Description = "Get order analytics"},
    @{Path = "/accommodations"; Description = "Get all accommodations"},
    @{Path = "/reviews"; Description = "Get all reviews"},
    @{Path = "/users"; Description = "Get users"},
    @{Path = "/bookings"; Description = "Get bookings"},
    @{Path = "/orders"; Description = "Get orders"}
)

foreach ($endpoint in $endpoints) {
    try {
        Write-Host "Testing: $($endpoint.Description)" -ForegroundColor Yellow
        Write-Host "URL: $baseUrl$($endpoint.Path)" -ForegroundColor Cyan
        
        $response = Invoke-WebRequest -Uri "$baseUrl$($endpoint.Path)" -Method GET -Headers @{"Content-Type"="application/json"} -ErrorAction Stop
        
        Write-Host "✅ Status: $($response.StatusCode) $($response.StatusDescription)" -ForegroundColor Green
        $content = $response.Content.Substring(0, [Math]::Min(200, $response.Content.Length))
        if ($response.Content.Length -gt 200) { $content += "..." }
        Write-Host "Response: $content" -ForegroundColor White
        
    } catch {
        $statusCode = $_.Exception.Response.StatusCode
        $statusDescription = $_.Exception.Response.StatusDescription
        Write-Host "❌ Status: $statusCode $statusDescription" -ForegroundColor Red
        
        try {
            $errorContent = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($errorContent)
            $errorBody = $reader.ReadToEnd()
            Write-Host "Error Response: $errorBody" -ForegroundColor Red
        } catch {
            Write-Host "Error Response: Could not read error body" -ForegroundColor Red
        }
    }    
    Write-Host ("-" * 80) -ForegroundColor Gray
}

Write-Host ""
Write-Host "📊 Testing Results Summary:" -ForegroundColor Green
Write-Host "✅ Endpoints that return 401 (Unauthorized) are working but need authentication" -ForegroundColor Yellow
Write-Host "✅ Endpoints that return 404 (Not Found) do not exist" -ForegroundColor Yellow  
Write-Host "✅ Endpoints that return 200 with data are working properly" -ForegroundColor Yellow
Write-Host "❌ Network errors indicate connection issues" -ForegroundColor Yellow
