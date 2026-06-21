import Pusher from 'pusher';

// Khởi tạo một lần duy nhất để dùng chung cho toàn bộ ứng dụng
export const pusherBe = new Pusher({
    appId: "2168985",
    key: "85a671177c6acaa8de58",
    secret: "87aed025f256021347f2",
    cluster: "ap1",
    useTLS: true,
});

// Hàm hỗ trợ gửi lỗi
export const sendErrorToClient = async (message: string) => {
    await pusherBe.trigger('checkout-errors', 'error-event', {
        message,
        timestamp: new Date().getTime(),
    });
};