/* eslint-disable */
//@ts-nocheck

export class ExtendableClass<T> {
  extend<D extends T>(domain: D): this & D {
    const that = this;
    const ThisClassProto = Object.getPrototypeOf(this);
    const DomainClassProto = Object.getPrototypeOf(domain);

    class ExtendedClass {
      constructor() {
        Object.assign(this, that);
        Object.assign(this, domain);
      }
    }

    // Копируем прототип исходного класса
    Object.setPrototypeOf(ExtendedClass.prototype, Object.getPrototypeOf(ThisClassProto));

    // Копируем все свойства (включая методы) из прототипа исходного класса
    Object.getOwnPropertyNames(ThisClassProto).forEach((propertyName) => {
      const descriptor = Object.getOwnPropertyDescriptor(ThisClassProto, propertyName);
      if (descriptor) {
        Object.defineProperty(ExtendedClass.prototype, propertyName, descriptor);
      }
    });

    // Копируем все свойства (включая методы) из прототипа domain класса
    Object.getOwnPropertyNames(DomainClassProto).forEach((propertyName) => {
      const descriptor = Object.getOwnPropertyDescriptor(DomainClassProto, propertyName);
      if (descriptor) {
        Object.defineProperty(ExtendedClass.prototype, propertyName, descriptor);
      }
    });

    const extended = new ExtendedClass() as typeof this & D;

    // Копируем все собственные свойства из исходных объектов
    Object.assign(extended, this, domain);

    return extended;
  }

  addTool<D extends T>(domain: D): this & { tools: D } {
    // Сохраняем текущий контекст
    const originalThis = this;

    // Получаем прототипы
    const OriginalProto = Object.getPrototypeOf(this);
    const DomainProto = Object.getPrototypeOf(domain);

    // Создаем новый класс-расширение
    class ExtendedClass extends (this.constructor as any) {
      tools: D;

      constructor() {
        super();
        // Копируем свойства исходного объекта
        Object.assign(this, originalThis);

        // Создаем инструменты с правильным прототипом
        this.tools = Object.create(DomainProto);
        Object.assign(this.tools, domain);

        // Копируем методы из DomainProto с правильной привязкой this
        Object.getOwnPropertyNames(DomainProto)
          .filter((name) => typeof DomainProto[name] === 'function')
          .forEach((methodName) => {
            if (!this.tools.hasOwnProperty(methodName)) {
              this.tools[methodName] = (...args: any[]) => {
                return DomainProto[methodName].apply(this.tools, args);
              };
            }
          });
      }
    }

    // Копируем статические свойства
    Object.setPrototypeOf(ExtendedClass, Object.getPrototypeOf(this.constructor));

    // Создаем экземпляр расширенного класса
    const extendedInstance = new ExtendedClass() as typeof this & { tools: D };

    return extendedInstance;
  }
}
