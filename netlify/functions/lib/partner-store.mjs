import {getStore} from '@netlify/blobs';
export function partnerStore(){return getStore({name:'plan-d-partners',consistency:'strong'});}
