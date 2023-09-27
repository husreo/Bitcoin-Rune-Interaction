"use client";
import Link from "next/link";
import { useState } from "react";

const Search = () => {
  const [value, setValue] = useState("");

  return (
    <>
      <input
        type="text"
        className="p-2 mb-2 border-black border-2"
        placeholder="enter tx id"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <Link href={`/?q=${value}`} className="bg-black text-white p-2">
        Search
      </Link>
    </>
  );
};

export default Search;
