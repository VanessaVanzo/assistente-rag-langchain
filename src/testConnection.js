
import driver from './config/database.js';

try {
  const session = driver.session();

  const result = await session.run(
    'RETURN "Conexão JavaScript + Neo4j funcionando!" AS mensagem'
  );

  console.log(result.records[0].get('mensagem'));
  await session.close();
} catch (error) {
  console.error('Erro na conexão:', error.message);
} finally {
  await driver.close();
}
