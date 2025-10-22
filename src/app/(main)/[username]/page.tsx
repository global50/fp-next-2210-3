import { ProfilePage } from "@/../apps/profile/src/ProfilePage";

interface Props {
  params: Promise<{
    username: string;
  }>;
}

export default async function UserProfilePage({ params }: Props) {
  const { username } = await params;
  return <ProfilePage username={username} />;
}
