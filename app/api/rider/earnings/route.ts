import { asRider } from "@/lib/riderHttp";
import { riderEarnings } from "@/lib/rider";
export const GET = () => asRider((r) => riderEarnings(r));
