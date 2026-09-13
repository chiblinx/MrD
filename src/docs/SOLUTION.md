# Solution

See the [project README](../../README.md) for setup and API usage, and the
[high-level architecture overview](./Acht-Overview.png) for the original design.

## Architecture

The app is split into a few small layers. The **Vanilla JavaScript UI** handles the search form, screen state and result rendering. It calls the **Express API**, where the **Search Controller** validates the request and passes it to the search service.

The **Search Service** owns the matching, filtering and sorting rules. It gets the base product data from the **Catalog Repository**, then asks the **Simulated Enrichment Provider** for the current price, availability and delivery estimate. The service combines both responses and sends the final results back to the UI.

This keeps the UI, HTTP handling, search logic and data access separate. It also makes the repository and enrichment provider easier to test or replace later.

## Trade-offs

- A local JSON catalog was chosen because the assignment does not require an external database.
- I chose to use Vanilla JS instead of Svelte because of my limited experience with svelte and the time constraints of the challenge. I wanted to focus on the task at hand rather than learning a new framework.
- I chose to use a simulated enrichment provider instead of building a separate service for upstream enrichment.
- on the UI part I used skeleton loading and optimistic rendering to improve perceived performance instead of using  an overlayed loading spinner. This allows the user to see the results as they are being enriched without disrupting the flow of the page and the user concentration. The user can see the results as they are being enriched, which improves the perceived performance of the application.

## AI Assistance

AI assistance was used for debugging and assist with test cases and documentation.
