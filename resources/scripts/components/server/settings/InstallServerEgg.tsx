import { ApplicationStore } from '@/state';
import { httpErrorToHuman } from '@/api/http';
import { ServerContext } from '@/state/server';
import React, { ChangeEvent, useEffect, useState } from 'react';
import { Actions, useStoreActions } from 'easy-peasy';
import installServerEgg from '@/api/server/installServerEgg';
import { Button } from '@/components/elements/button';
import TitledGreyBox from '@/components/elements/TitledGreyBox';
import Select from '@/components/elements/Select';
import StoreContainer from '@/components/elements/StoreContainer';
import { Egg, getEggs } from '@/api/store/getEggs';
import { Nest, getNests } from '@/api/store/getNests';
import { Dialog } from '@/components/elements/dialog';
import StoreError from '@/components/elements/store/StoreError';

export default () => {
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const [modalVisible, setModalVisible] = useState(false);

    const [egg, setEgg] = useState<number>(0);
    const [eggs, setEggs] = useState<Egg[]>();
    const [nest, setNest] = useState<number>(0);
    const [nests, setNests] = useState<Nest[]>();

    const { addFlash, clearFlashes } = useStoreActions((actions: Actions<ApplicationStore>) => actions.flashes);

    const installServer = (egg: number) => {
        clearFlashes('settings');
        installServerEgg(uuid, egg)
            .then(() => {
                addFlash({
                    key: 'settings',
                    type: 'success',
                    message: 'Your server has begun the installation process.',
                });
            })
            .catch((error) => {
                console.error(error);

                addFlash({ key: 'settings', type: 'danger', message: httpErrorToHuman(error) });
            })
            .then(() => setModalVisible(false));
    };

    useEffect(() => {
        clearFlashes();
        getNests().then((nests) => setNests(nests));
        getEggs().then((eggs) => setEggs(eggs));
    }, []);

    const changeNest = (e: ChangeEvent<HTMLSelectElement>) => {
        setNest(parseInt(e.target.value));

        getEggs(parseInt(e.target.value)).then((eggs) => {
            setEggs(eggs);
            setEgg(eggs[0].id);
        });
    };

    if (!nests || !eggs) {
        return (
            <StoreError
                message={'No server types are available for deployment. Try again later.'}
                admin={'Ensure you have at least one egg which is in a public nest.'}
            />
        );
    }

    return (
        <StoreContainer className={'lg:grid lg:grid-cols-3 my-10 gap-4'}>
            <Dialog.Confirm
                open={modalVisible}
                title={'Confirm server reinstallation'}
                confirm={'Yes, reinstall server'}
                onClose={() => setModalVisible(false)}
                onConfirmed={() => installServer(egg)}
            >
                Your server will be stopped and some files may be deleted or modified during this process, are you sure
                you wish to continue?
            </Dialog.Confirm>
            <TitledGreyBox title={'Server Nest'} className={'mt-8 sm:mt-0'}>
                <Select name={'nest'} onChange={(nest) => changeNest(nest)}>
                    {!nest && <option>Select a nest...</option>}
                    {nests.map((n) => (
                        <option key={n.id} value={n.id}>
                            {n.name}
                        </option>
                    ))}
                </Select>
                <p className={'mt-1 text-xs text-gray-400'}>Select a nest to use for your server.</p>
            </TitledGreyBox>
            {/*<TitledGreyBox title={'Server Egg'} className={'mt-8 sm:mt-0'}>*/}
            {/*    <Select name={'egg'} onChange={(e) => setEgg(parseInt(e.target.value))}>*/}
            {/*        {!egg && <option>Select an egg...</option>}*/}
            {/*        {eggs.map((e) => (*/}
            {/*            <option key={e.id} value={e.id}>*/}
            {/*                {e.name}*/}
            {/*            </option>*/}
            {/*        ))}*/}
            {/*    </Select>*/}
            {/*    <p className={'mt-1 text-xs text-gray-400'}>Choose what game you want to run on your server.</p>*/}
            {/*</TitledGreyBox>*/}
            <Button.Danger onClick={() => setModalVisible(true)}>Install Server</Button.Danger>
        </StoreContainer>
    );
};
