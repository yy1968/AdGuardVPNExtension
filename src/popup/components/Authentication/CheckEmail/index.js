import React, { useContext } from 'react';
import { observer } from 'mobx-react';

import rootStore from '../../../stores';
import { REQUEST_STATUSES } from '../../../stores/consts';

import Terms from '../Terms';
import Submit from '../Submit';
import InputField from '../InputField';

const CheckEmail = observer(() => {
    const { authStore } = useContext(rootStore);

    // TODO ??? changes to signIn page
    // useEffect(() => {
    //     (async () => {
    //         await authStore.getAuthCacheFromBackground();
    //     })();
    // }, []);

    const submitHandler = async (e) => {
        e.preventDefault();
        await authStore.checkEmail();
    };

    const inputChangeHandler = (e) => {
        const { target: { name, value } } = e;
        authStore.onCredentialsChange(name, value);
    };

    const { requestProcessState, credentials } = authStore;
    const { username } = credentials;

    return (
        <form
            className={`form form--login ${authStore.error && 'form--error'}`}
            onSubmit={submitHandler}
        >
            <div className="form__inputs">
                <InputField
                    id="username"
                    type="email"
                    value={username}
                    label="Email (AdGuard account)"
                    inputChangeHandler={inputChangeHandler}
                    error={authStore.error}
                />
                {authStore.error && (
                    <div className="form__error">
                        {authStore.error}
                    </div>
                )}
            </div>
            <Terms />
            <div className="form__btn-wrap form__btn-wrap--check">
                <Submit
                    text="Next"
                    processing={requestProcessState === REQUEST_STATUSES.PENDING}
                    disabled={!username}
                />
            </div>
        </form>
    );
});

export default CheckEmail;
