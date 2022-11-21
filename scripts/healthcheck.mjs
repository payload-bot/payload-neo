import { fetch, FetchResultTypes } from "@sapphire/fetch";

const response = await fetch("http://localhost:8080/api/health", FetchResultTypes.Result);

if (!response.ok) {
  process.exit(12);
}

process.exit(0);
