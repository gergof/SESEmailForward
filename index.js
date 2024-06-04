import { SESClient, SendRawEmailCommand } from '@aws-sdk/client-ses';

const forwardFrom = process.env.from_address;
const forwardTo = process.env.to_address;

export const handler = async (event) => {
    const msgInfo = JSON.parse(event.Records[0].Sns.Message);

    if (
        msgInfo.receipt.spamVerdict.status === 'FAIL' ||
        msgInfo.receipt.virusVerdict.status === 'FAIL'
    ) {
        // Don't process spam messages
        console.log('Message is spam or contains virus, ignoring.');
        return;
    }

    const headers = [
        `From: ${msgInfo.mail.commonHeaders.from[0].replace(/<(.*)>/, '')} <${forwardFrom}>`,
        `To: ${msgInfo.mail.commonHeaders.to}`,
        `Reply-To: ${msgInfo.mail.commonHeaders.from[0]}`,
        `X-Original-To: ${msgInfo.mail.commonHeaders.to[0]}`,
        `Subject: [Incoming] ${msgInfo.mail.commonHeaders.subject}`,
    ];

    let email = msgInfo.content;

    if (email) {
        const boundary = email.match(/Content-Type:.+\s*boundary.*/);
        if (boundary) {
            headers.push(boundary[0]);
        } else {
            const contentType = email.match(/^Content-Type:(.*)/m);
            if (contentType) {
                headers.push(contentType[0]);
            }
        }

        const contentTransferEncoding = email.match(
            /^Content-Transfer-Encoding:(.*)/m,
        );
        if (contentTransferEncoding) {
            headers.push(contentTransferEncoding[0]);
        }

        const mimeVersion = email.match(/^MIME-Version:(.*)/m);
        if (mimeVersion) {
            headers.push(mimeVersion[0]);
        }

        // remove headers from original email
        email = email.split('\r\n\r\n').slice(1).join('\r\n\r\n');
    } else {
        email = 'Empty email';
    }

    const command = SendRawEmailCommand({
        Source: forwardFrom,
        Destinations: [forwardTo],
        RawMessage: {
            Data: headers.join('\r\n') + '\r\n\r\n' + email,
        },
    });

    const client = new SESClient();

    await client.send(command);
};
