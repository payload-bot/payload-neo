import { fetch, FetchResultTypes } from "@sapphire/fetch";

const response = await fetch("http://127.0.0.1:8080/api/health", FetchResultTypes.Result);

if (!response.ok) {
  process.exit(12);
}

process.exit(0);
