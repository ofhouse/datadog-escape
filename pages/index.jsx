import { useState, useMemo, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

import styles from './index.module.css';

const ESCAPE_CHAR = '\\';

// Special characters (single)
// See: https://docs.datadoghq.com/logs/explorer/search_syntax/#escaping-of-special-characters
const singleOperators = new Set([
  ' ',
  '+',
  '-',
  '=',
  '>',
  '<',
  '!',
  '(',
  ')',
  '{',
  '}',
  '[',
  ']',
  '^',
  '"',
  '“',
  '”',
  '~',
  '*',
  '?',
  ':',
  '\\',
  '/',
]);

function escapeString(input) {
  let stringIndex = 0;
  let result = '';
  while (stringIndex < input.length) {
    const charAt = input[stringIndex];
    const charAtNext = input[stringIndex + 1];
    // Special handling for && AND ||
    if (
      (charAt === '&' && charAtNext === '&') ||
      (charAt === '|' && charAtNext === '|')
    ) {
      result += ESCAPE_CHAR + charAt + ESCAPE_CHAR + charAtNext;
      stringIndex = stringIndex + 2;
      continue;
    }

    if (singleOperators.has(charAt)) {
      result += ESCAPE_CHAR;
    }

    result += charAt;
    stringIndex++;
  }

  return result;
}

function MainPage({ initialQuery = '' }) {
  const router = useRouter();
  const [value, setValue] = useState(() => {
    return decodeURIComponent(initialQuery);
  });
  const escapedValue = useMemo(() => escapeString(value), [value]);

  useEffect(() => {
    window.history.replaceState(null, '', `/?q=${encodeURIComponent(value)}`);
  }, [value, router]);

  return (
    <>
      <Head>
        <title>Escape Datadog</title>
      </Head>
      <div className={styles.container}>
        <textarea
          className={styles.field}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Insert query..."
        />

        <textarea
          className={styles.field}
          value={escapedValue}
          onClick={(event) => {
            event.target.select();
          }}
          readOnly
        />
      </div>
    </>
  );
}

export async function getServerSideProps({ query }) {
  return {
    props: { initialQuery: query.q },
  };
}

export default MainPage;
