@log
class Person { 
  @log
  public name: string;
  constructor(name : string) { 
    this.name = name;
  }
  @log
  public greet(@log message : string) : string { 
    return `${this.name} say: ${message}`;
  }
}

function log(...args: any[]) {
  args = args.filter(el => el !== undefined)
  switch(args.length) {
    case 1:
      console.log('打印构造函数', args)
      break;
    case 2:
      console.log('打印属性名', args)
      break;
    case 3:
      if(typeof args[2] === 'number') {
        console.log('打印参数位置', args);
      } else {
        console.log('打印方法名', args);
      }
      break;
    default:
      throw Error('装饰器异常')
  }
}