import {
  MessageEmbed,
  MessageAttachment,
  Discord,
  Messages,
  stringFormat,
  queues
} from '../global.mjs';

import { VM } from 'vm2';
import { loopWhile } from 'deasync';
import { fileURLToPath } from 'url';
import { resolve, dirname } from 'node:path';
import execute from '../execute.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default async function(message, code, client) {
  if (!(await client.application.fetch()).owner.members.has(message.author.id)) return;
  let result;
  try {
    const sandbox = { };
    for (const key in global)
    if ("global" !== key)
      sandbox[key] = global[key];
    Object.assign(sandbox, {
      message,
      client,
      MessageEmbed,
      MessageAttachment,
      Discord,
      Messages,
      stringFormat,
      queues,
      process,
      require
    });
    result = execute(code, sandbox);
  } catch (e) {
    result = e;
  }
  if (result === void 0) return;
  if (Object.prototype.toString.call(result) === "[object Error]")
    await message.channel.send(Error.prototype.toString.call(result));
  else await message.channel.send(
    (await import('util')).inspect(result),
    { split: true, code: "js" }
  );
}

function require(_path) {
  async function _require(path) { 
    path = path.resolve(__dirname, path);
    const res = await import(path);
    return res.default || res;
  };
  let result = _require(_path);
  let done = false;
  let _return;
  result
  .then(v => {
    _return = v;
    done = true;
  })
  .catch(e => {
    _return = e;
    done = true;
  });
  loopWhile(() => !done);
  return _return;
};
require.prototype.toString(() => "function require() { }");
