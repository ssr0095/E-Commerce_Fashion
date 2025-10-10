import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SearchBar from "../components/SearchBar";

export const MainLayout = ({ children }) => {
  return (
    <>
      <Navbar />
      <SearchBar />
      {children}
      <Footer />
    </>
  );
};

export const AuthLayout = ({ children }) => {
  return <>{children}</>;
};
