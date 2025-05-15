import Hero from "../components/Hero";
import LatestCollection from "../components/LatestCollection";
import BestSeller from "../components/BestSeller";
// import OurPolicy from "../components/OurPolicy";
// import NewsletterBox from "../components/NewsletterBox";
import InfiniteBanner from "../components/InfiniteBanner";
import ShopByCategory from "../components/ShopByCategory";
import NavigationBar from "../components/NavigationBar";

const Home = () => {
  return (
    <div>
      {/* NAVIGATION BAR */}
      <NavigationBar />
      <Hero />
      <InfiniteBanner />
      <ShopByCategory />
      <LatestCollection />
      <BestSeller />
      {/* <OurPolicy /> */}
      {/* <NewsletterBox /> */}
    </div>
  );
};

export default Home;
