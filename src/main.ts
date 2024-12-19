import { startServer } from './server';
import { startIndexing } from './listener';

async function main() {
  try {
    // Start the indexer
    await startIndexing();
    
    // Start the server
    await startServer();

  } catch (error) {
    console.error('Error starting application:', error);
    process.exit(1);
  }
}

main().catch(console.error);
