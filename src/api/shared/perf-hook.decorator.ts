import { Logger } from "@nestjs/common";
import { performance } from "perf_hooks";

export const Benchmark = (
  _target: object,
  propertyKey: string | symbol,
  descriptor: PropertyDescriptor
) => {
  const originalMethod = descriptor.value;
  const logger = new Logger(originalMethod.name);

  descriptor.value = async function (...args: any[]) {
    const start = performance.now();
    const result = await originalMethod.apply(this, args);
    const end = performance.now();

    logger.debug(
      `${String(propertyKey)} took ${end - start} ms`
    );

    return result;
  };
};
