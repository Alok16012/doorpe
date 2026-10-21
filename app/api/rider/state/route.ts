import { asRider } from "@/lib/riderHttp";
import { riderState } from "@/lib/rider";
export const GET = () => asRider((r) => riderState(r));
