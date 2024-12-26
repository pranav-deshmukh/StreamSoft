import Create from "@/components/Create";

export default function Page() {
  return (
    <div className="h-full flex bg-[#eef0f6]">
      <section className="bg-[#a6a6dd] w-[40%] flex flex-col items-center pt-4">
        <Create />
      </section>
      <section className="w-full flex flex-col justify-center px-8 gap-y-14">
        <h1 className="text-4xl font-bold text-blue-700">
          Live stream on a platform easily
        </h1>
        <ul className="text-lg font-semibold text-gray-500 flex flex-col gap-y-4">
          <li>1. Click on Live stream</li>
          <li>2. Select a platform to stream on</li>
          <li>3. Enter your secret key</li>
          <li>4. Check your voice and video settings.</li>
          <li>5. Click on start streaming and all set 😎</li>
        </ul>
      </section>
    </div>
  );
}
