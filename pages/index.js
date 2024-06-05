import { useState, useEffect } from 'react';
import Grid from '../components/Grid';
import styles from '../styles/Home.module.css';
import rpcUrls from '../config/rpc-urls.json';

const rpcMethods = [
  'eth_blockNumber',
  'eth_getBlockByNumber',
  'eth_getBlockByHash',
  'eth_getBlockTransactionCountByNumber',
  'eth_getBlockTransactionCountByHash',
  'eth_getTransactionByHash',
  'eth_getTransactionByBlockNumberAndIndex',
  'eth_getTransactionByBlockHashAndIndex',
  'eth_getTransactionReceipt',
  'eth_call',
  'eth_sendTransaction',
  'eth_sendRawTransaction',
  'eth_getLogs',
  'eth_getBalance',
  'eth_gasPrice'
];

const benchmarkRpc = async (rpcUrl, method) => {
  const requestData = {
    jsonrpc: '2.0',
    method,
    params: [],
    id: 1
  };

  const startTime = performance.now();
  try {
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData)
    });

    const endTime = performance.now();

    const result = await response.json();

    if (!response.ok) {
      const errorMessage = result.error ? result.error.message : `HTTP error! status: ${response.status}`;
      throw new Error(errorMessage);
    }

    if (result.error) {
      throw new Error(result.error.message);
    }

    return { time: endTime - startTime, error: false, errorMessage: '' };
  } catch (error) {
    const endTime = performance.now();
    return { time: endTime - startTime, error: true, errorMessage: `${error.message} (${(endTime - startTime).toFixed(2)} ms)` };
  }
};

const Home = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchBenchmarkData = async () => {
      const results = [];

      for (const rpcUrl of rpcUrls.rpcUrls) {
        const responses = [];
        for (const method of rpcMethods) {
          const result = await benchmarkRpc(rpcUrl, method);
          responses.push({ method, ...result });
        }
        results.push({ rpcUrl, responses });
      }

      setData(results);
    };
    fetchBenchmarkData();
  }, []);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>RPC Benchmark</h1>
      <Grid data={data} />
    </div>
  );
};

export default Home;


