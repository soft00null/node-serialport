'use strict';

var assert = require('chai').assert;
var SerialPortBinding = require('../lib/bindings');

var platform;
switch (process.platform) {
  case 'win32':
    platform = 'win32';
    break;
  case 'darwin':
    platform = 'darwin';
    break;
  default:
    platform = 'unix';
}

var defaultPortOpenOptions = {
  baudRate: 9600,
  parity: 'none',
  xon: false,
  xoff: false,
  xany: false,
  rtscts: false,
  hupcl: true,
  dataBits: 8,
  stopBits: 1,
  bufferSize: 64 * 1024,
  platformOptions: {}
};

var testPort = process.env.TEST_PORT;

describe('SerialPortBinding', function () {
  describe('#open', function() {
    if (!testPort) {
      it('Cannot be tested as we have no test ports');
      return;
    }

    it('returns a file descriptor', function(done) {
      SerialPortBinding.open(testPort, defaultPortOpenOptions, function(err, fd) {
        assert.isNull(err);
        assert.isNumber(fd);
        SerialPortBinding.close(fd, done);
      });
    });
  });

  describe('#list', function() {
    it('returns an array', function(done) {
      SerialPortBinding.list(function(err, data) {
        assert.isNull(err);
        assert.isArray(data);
        done();
      });
    });

    it('has objects with undefined when there is no data', function(done) {
      SerialPortBinding.list(function(err, data) {
        assert.isNull(err);
        assert.isArray(data);
        if (data.length === 0) {
          console.log('no ports to test');
          return done();
        }
        var obj = data[0];
        Object.keys(obj).forEach(function(key) {
          assert.notEqual(obj[key], '', 'empty values should be undefined');
          assert.isNotNull(obj[key], 'empty values should be undefined');
        });
        done();
      });
    });
  });

  describe('#update', function() {
    if (platform === 'win32') {
      it('on windows it returns an error', function(done) {
        SerialPortBinding.update(1, defaultPortOpenOptions, function(err, data) {
          assert.instanceOf(err, Error);
          assert.isUndefined(data);
          done();
        });
      });
      return;
    }

    if (!testPort) {
      it('Cannot be tested as we have no test ports');
      return;
    }

    beforeEach(function(done) {
      SerialPortBinding.open(testPort, defaultPortOpenOptions, function(err, fd) {
        assert.isNull(err);
        assert.isNumber(fd);
        this.fd = fd;
        done();
      }.bind(this));
    });

    afterEach(function(done) {
      var fd = this.fd;
      this.fd = null;
      SerialPortBinding.close(fd, done);
    });

    it('updates nothing', function(done) {
      SerialPortBinding.update(this.fd, defaultPortOpenOptions, done);
    });
  });
});
