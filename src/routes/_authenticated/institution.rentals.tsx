import { createFileRoute } from "@tanstack/react-router";
import { RentalsWorkspace } from "@/components/rentals/RentalsWorkspace";
import { requireClientAuthRoute } from "@/lib/route-guards";

export const Route = createFileRoute("/_authenticated/institution/rentals")({
  beforeLoad: () => requireClientAuthRoute(),
  component: () => <RentalsWorkspace role="institution" />,
});
