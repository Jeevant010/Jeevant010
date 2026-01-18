import PrivateLayoutWrapper from "@/components/layout/PrivateLayoutWrapper";

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PrivateLayoutWrapper>
      {children}
    </PrivateLayoutWrapper>
  );
}