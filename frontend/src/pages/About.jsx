// import { useContext, useEffect } from "react";
import Title from "../components/Title";
import { assets } from "../assets/assets";
// import NewsletterBox from "../components/NewsletterBox";
import SmallNavBar from "../components/SmallNavBar";
import { Helmet } from "react-helmet-async";

const About = () => {
  return (
    <div className="px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]">
      <Helmet>
        {/* Basic */}
        <title>About Us — Cousins Fashion</title>
        <meta
          name="title"
          content="About Us | Cousins Fashion — Streetwear for the Bold"
        />
        <meta
          name="description"
          content="Discover the story behind Cousins Fashion, where streetwear meets personality. We're redefining style through oversized, minimalist, and vintage pieces for all."
        />
        <link rel="canonical" href={"https://cousinsfashion.in/about"} />
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="About — Cousins Fashion" />
        <meta
          property="og:description"
          content="Discover the story behind Cousins Fashion, where streetwear meets personality. We're redefining style through oversized, minimalist, and vintage pieces for all."
        />
        <meta property="og:url" content={"https://cousinsfashion.in/about"} />
        <meta property="og:image" content={assets.about_img} />
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      <SmallNavBar navs={["About"]} />
      <div className="text-2xl text-center pt-8 border-t">
        <Title text1={"ABOUT"} text2={"US"} />
      </div>

      <div className="my-10 flex flex-col lg:flex-row gap-16">
        <img
          className="w-full lg:max-w-[450px] aspect-[3/4]"
          src={assets.about_img}
          loading="eager"
          alt="about"
        />
        <div className="flex flex-col justify-center gap-6 lg:w-2/4 text-gray-600">
          <p>
            CousinsFashion is your go-to destination for stylish, high-quality
            clothing that blends trend and comfort effortlessly. Our journey
            began with a passion for fashion and a vision to bring unique,
            modern, and timeless styles to everyone. From chic casual wear to
            elegant party outfits, we offer a well-curated collection of men’s
            and women’s fashion, including dresses, denim, tops, ethnic wear,
            and accessories.
          </p>
          <p>
            We believe fashion is more than just clothing—it’s a statement, an
            expression of personality, and a way to feel confident. At
            CousinsFashion, we ensure that every piece is crafted with care,
            using premium fabrics and contemporary designs that make you stand
            out.
          </p>
          <h2 className="text-gray-800">Our Mission</h2>
          <p>
            Shop online with ease and enjoy seamless shopping, secure payments,
            and quick deliveries. Whether you're looking for the latest trends
            or wardrobe essentials, CousinsFashion is here to style you with
            elegance and ease. Connect with us on WhatsApp for custom orders and
            exclusive designs!
          </p>
        </div>
      </div>

      <div className=" text-xl py-4">
        <Title text1={"WHY"} text2={"CHOOSE US"} />
      </div>

      <div className="flex flex-col md:flex-row text-sm mb-20">
        <div className="border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5">
          <h2>Quality Assurance:</h2>
          <p className=" text-gray-600">
            We meticulously select and vet each product to ensure it meets our
            stringent quality standards.
          </p>
        </div>
        <div className="border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5">
          <h2>Convenience:</h2>
          <p className=" text-gray-600">
            With our user-friendly interface and hassle-free ordering process,
            shopping has never been easier.
          </p>
        </div>
        <div className="border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5">
          <h2>Exceptional Customer Service:</h2>
          <p className=" text-gray-600">
            Our team of dedicated professionals is here to assist you the way,
            ensuring your satisfaction is our top priority.
          </p>
        </div>
      </div>

      {/* <NewsletterBox /> */}
    </div>
  );
};

export default About;
