# A2Workspace/Arrestor-Gear

A pretty promise error handling library.

## Quickstart

```js
import arrestorGear from '@a2workspace/arrestor-gear';

const ag = arrestorGear(axios.post(API_URL, { formData }));

ag.onFulfilled(() => {
  this.$message.success('Created');
  this.$router.back(-1);
});

ag.finally(() => {
  this.processing = false;
});

ag.captureValidationError(true, (messageBag) => {
  this.$message.error(messageBag.first());

  this.errors = messageBag.all((messages) => messages[0]);
});

ag.captureStatusCode([401, 403], (reason) => {
  this.$message.error('Forbidden');
});

ag.captureStatusCode('5XX', (reason) => {
  this.$message.error('Server Error');
});

ag.captureAxiosError((reason) => {
  this.$message.error('Bad Request');
});

ag.captureAny((error) => {
  this.$message.error('Something wrong here');
  
  console.error(error);
});
```
