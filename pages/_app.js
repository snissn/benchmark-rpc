import 'bulma/css/bulma.min.css';
import Head from 'next/head';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>RPC Benchmark</title>
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;

