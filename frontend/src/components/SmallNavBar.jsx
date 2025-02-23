import { Link } from "react-router-dom";

const SmallNavBar = ({ navs }) => {
  return (
    <div className="w-fit flex items-center text-sm gap-2 text-gray-500 my-4 cursor-default">
      <Link to={"/"}>Home</Link> <span> / </span>
      {navs.map((item, index) => {
        return index !== navs.length - 1 ? (
          <Link to={"/" + item.toLowerCase()} key={index}>
            {item} <span> / </span>
          </Link>
        ) : (
          <p key={index} className=" text-gray-700">
            {item}
          </p>
        );
      })}
    </div>
  );
};

export default SmallNavBar;
