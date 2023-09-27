"use server";
import Link from "next/link";
import Search from "../components/Search";
import { Transaction } from "@prisma/client";
import axios from "axios";
import Table from "../components/Table";

const backendURL = process.env.BACKEND_URL;

async function getTransactions(): Promise<Transaction[]> {
  try {
    const response = await axios.get(`${backendURL}/tx`);
    return response.data;
  } catch (e) {
    return [];
  }
}

async function getOneTransaction(txId: string): Promise<Transaction | null> {
  try {
    const response = await axios.get(`${backendURL}/tx/${txId}`);
    return response.data;
  } catch (e) {
    return null;
  }
}

export default async function Home({ searchParams }: { searchParams: any }) {
  let transactions = await getTransactions();
  let searchTransaction: Transaction | null = null;
  let isError = false;

  if (searchParams && searchParams?.q && searchParams.q != "") {
    try {
      searchTransaction = await getOneTransaction(searchParams.q);
    } catch (e) {
      isError = true;
    }
  }

  return (
    <main className="flex w-full flex-col items-center h-screen my-5">
      <div>
        <h1 className="text-3xl mb-4 text-center">
          Search Transactions / Issuances
        </h1>
        <div className="w-full flex flex-col">
          <Search />

          {isError && <p>Invalid Tx</p>}
          {searchTransaction && (
            <div className="mt-5">
              <Table transactions={[searchTransaction]} />
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-col items-center w-full mt-14">
        <h1 className="text-3xl mb-4 text-center">
          Recent Transactions / Issuances
        </h1>
        <Table transactions={transactions} />
      </div>
    </main>
  );
}
