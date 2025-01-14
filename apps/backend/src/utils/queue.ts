type Entry<T> = {
  lazyTask: () => Promise<T>;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: unknown) => void;
};

export class SequentialQueue {
  private queue = new Array<Entry<unknown>>();

  public push(task: () => Promise<unknown>): Promise<unknown> {
    return new Promise<unknown>((resolve, reject) => {
      const entry: Entry<unknown> = {
        lazyTask: task,
        resolve: resolve,
        reject: reject
      };

      this.pushTask(entry);
    });
  }

  private executeNext() {
    if (this.queue.length === 0) {
      return;
    }

    const item = this.queue[0];
    try {
      const task = item.lazyTask();
      task
        .then((val) => {
          item.resolve(val);
          this.popTask();
        })
        .catch((error) => {
          item.reject(error);
          this.popTask();
        });
    } catch (e1) {
      try {
        item.reject(e1);
      } catch (e2) {
        console.error(e2);
      }
      this.popTask();
    }
  }

  private popTask() {
    this.queue.shift();
    this.executeNext();
  }

  private pushTask(entry: Entry<unknown>) {
    this.queue.push(entry);
    if (this.queue.length === 1) {
      this.executeNext();
    }
  }
}
