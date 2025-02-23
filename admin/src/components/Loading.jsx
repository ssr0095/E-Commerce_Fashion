const Loading = () => {
  return (
    <div className="w-full h-svh flex items-center justify-center">
      <div className="relative inline-flex">
        <div className="size-16 rounded-full bg-black" />
        <div className="absolute left-0 top-0 size-16 animate-ping rounded-full bg-black" />
        <div className="absolute left-0 top-0 size-16 animate-pulse rounded-full bg-black" />
      </div>
    </div>
  );
};

export default Loading;
