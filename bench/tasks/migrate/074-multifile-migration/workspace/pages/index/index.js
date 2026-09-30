import { step } from '../../lib/step.js';
Page({ data: {title:'Multi-file',info:'',count:2}, increment() { this.setData({count:this.data.count+step}); }, about() { this.setData({info:'AIUI'}); } });
