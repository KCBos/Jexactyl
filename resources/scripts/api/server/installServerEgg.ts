import http from '@/api/http';

export default (uuid: string, egg: number): Promise<void> => {
    return new Promise((resolve, reject) => {
        http.post(`/api/client/servers/${uuid}/settings/installServerEgg`, { egg })
            .then(() => resolve())
            .catch(reject);
    });
};
