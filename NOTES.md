# Notes

Considering what already exists, prioritization was placed on the Alerts API testing, to ensure backend is ready enough to be used in a future implementation of the Alerts UI. Also, basic testing was added for the Rates API.

Regarding the frontend, a few cases were mocked (bypassing the Xe API) to simulate scenarios of errors on server side. Those case include badly formed rates, as well as 503 errors intruduced as part of the response.

## Running test suite

1. Having docker installed, run `docker-compose up -d`. This will compile and make services available.
    1. In case you don't have docker available, you can try installing dotnet and nodejs.
2. cd into frontend folder, run `npx playwright test`. This will run all available tests.
3. Run `npx playwright show-report` to show report of tests and results. For each test, details can be viewed.
4. To stop all containers, run `docker-compose down`