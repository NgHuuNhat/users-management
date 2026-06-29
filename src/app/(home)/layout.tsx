
import Header from "@/core/features/(home)/Header";

type Props = {
  children: React.ReactNode;
};

export default function HomeLayout({ children }: Props) {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-white">{children}</main>
    </>
  );
}