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
  'eth_getTransactionReceipt',
  'eth_call',
  'eth_getLogs',
  'eth_getBalance',
  'eth_gasPrice'
];

const methodParams = (latestBlockNumber, latestBlockHash, latestTransactionHash) => ({
  'eth_blockNumber': [],
  'eth_getBlockByNumber': [latestBlockNumber, true],
  'eth_getBlockByHash': [latestBlockHash, true],
  'eth_getBlockTransactionCountByNumber': [latestBlockNumber],
  'eth_getBlockTransactionCountByHash': [latestBlockHash],
  'eth_getTransactionByHash': [latestTransactionHash],
  'eth_getTransactionReceipt': [latestTransactionHash],
  'eth_call': [{ to: "0x0000000000000000000000000000000000000000" }, "latest"],
  'eth_getLogs': [{ fromBlock: "latest", address: "0x0000000000000000000000000000000000000000" }],
  'eth_getBalance': ["0x0000000000000000000000000000000000000000", "latest"],
  'eth_gasPrice': []
});

const fetchLatestBlockInfo = async (rpcUrl) => {
  const blockNumberResult = await benchmarkRpc(rpcUrl, 'eth_blockNumber', []);
  if (blockNumberResult.error) throw new Error(blockNumberResult.errorMessage);
  const latestBlockNumber = blockNumberResult.result;

  const blockResult = await benchmarkRpc(rpcUrl, 'eth_getBlockByNumber', [latestBlockNumber, true]);
  if (blockResult.error) throw new Error(blockResult.errorMessage);
  const latestBlockHash = blockResult.result.hash;
  const latestTransactionHash = blockResult.result.transactions.length > 0 ? blockResult.result.transactions[0].hash : null;

  return { latestBlockNumber, latestBlockHash, latestTransactionHash };
};

const benchmarkRpc = async (rpcUrl, method, params) => {
  const requestData = {
    jsonrpc: '2.0',
    method,
    params,
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

    return { time: endTime - startTime, result: result.result, error: false, errorMessage: '' };
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
        try {
          const { latestBlockNumber, latestBlockHash, latestTransactionHash } = await fetchLatestBlockInfo(rpcUrl);
          const params = methodParams(latestBlockNumber, latestBlockHash, latestTransactionHash);

          const responses = [];
          for (const method of rpcMethods) {
            const param = params[method];
            if (param.includes(null)) {
              responses.push({
                method,
                time: 0,
                error: true,
                errorMessage: 'No transaction hash available'
              });
            } else {
              const result = await benchmarkRpc(rpcUrl, method, param);
              responses.push({ method, ...result });
            }
          }
          results.push({ rpcUrl, responses });
        } catch (error) {
          results.push({
            rpcUrl,
            responses: rpcMethods.map(method => ({
              method,
              time: 0,
              error: true,
              errorMessage: error.message
            }))
          });
        }
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


