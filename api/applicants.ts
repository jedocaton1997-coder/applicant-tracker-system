import { handleSharedApplicants } from "../server/sharedApplicants";

export default async function handler(req: Parameters<typeof handleSharedApplicants>[0], res: Parameters<typeof handleSharedApplicants>[1]) {
  await handleSharedApplicants(req, res);
}
