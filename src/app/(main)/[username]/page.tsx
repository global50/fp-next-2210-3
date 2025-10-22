import { ProfilePage } from "@/../apps/profile/src/ProfilePage";

interface Props {
  params: {
    username: string;
  };
}

export default function UserProfilePage({ params }: Props) {
  return <ProfilePage username={params.username} />;
}
