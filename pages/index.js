import BenchmarkSection from '../components/BenchmarkSection';
import styles from '../styles/Home.module.css';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const filecoinRpcUrls = [
  "https://fil-mainnet-1.rpc.laconic.com/rpc/v1",
  "https://filecoin.chainup.net/rpc/v1",
  "https://api.node.glif.io",
  "https://filfox.info/rpc/v1",
  "https://filecoin.drpc.org"
];

const ethereumRpcUrls = [
  "https://eth.llamarpc.com",
  "https://public.stackup.sh/api/v1/node/ethereum-mainnet",
  "https://ethereum.blockpi.network/v1/rpc/public",
  "https://eth-pokt.nodies.app",
];

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


const exportToPDF = () => {
  const input = document.getElementById('benchmark-table');
  html2canvas(input).then(canvas => {
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('landscape', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('benchmark.pdf');
  });
};

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

const fetchBenchmarkData = async (rpcUrls, rpcMethods) => {
  const results = [];

  for (const rpcUrl of rpcUrls) {
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

  return results;
};

const Home = () => {
  return (
    <div className={styles.container}>
      <h1 className="title is-1">RPC Benchmark</h1>
      <div className="content">
        <p>
          This application benchmarks various Ethereum JSON-RPC endpoints. It performs multiple tasks such as fetching block numbers, block details, transaction details, and more.
        </p>
        <p>
          The results are displayed in a table where each row represents an RPC method and each column represents an RPC URL. Yellow cells indicate response times greater than 200 ms, while red cells indicate response times greater than 500 ms.
        </p>
        <p>
          The summary rows at the bottom show the average and median response times for each RPC method across all URLs.
        </p>
        <p>
          Source code available on <a href="https://github.com/snissn/benchmark-rpc" target="_blank" rel="noopener noreferrer">GitHub</a>.
        </p>
        <button onClick={exportToPDF} className="button is-primary">Export to PDF</button>
      </div>
      <div id="benchmark-table">
	      <BenchmarkSection
		title="Filecoin ETH RPC Benchmark"
		rpcUrls={filecoinRpcUrls}
		rpcMethods={rpcMethods}
		fetchBenchmarkData={fetchBenchmarkData}
	      />
	      <BenchmarkSection
		title="Ethereum RPC Benchmark"
		rpcUrls={ethereumRpcUrls}
		rpcMethods={rpcMethods}
		fetchBenchmarkData={fetchBenchmarkData}
	      />
    </div>
    </div>
  );
};

export default Home;


