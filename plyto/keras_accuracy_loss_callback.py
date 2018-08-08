from keras.callbacks import Callback
from time import time
from .plyto import PlytoAPI


class KerasAccuracyLossCallback(Callback):

    """
    Create a callback that will track and display training progress, loss, and accuracy
    :param sample_amount: number of samples/steps per epoch
    :param epochs: number of epochs
    :param total_progress: progress of training for all epochs
    :param epoch_progress: progress of training in current epoch
    :param mode: track if model is using samples (0) or steps (1)
    :param total_runtime: the total runtime for training
    """

    def __init__(self, plyto_instance):
        self.loss = 0
        self.accuracy = 0
        self.epochs = None
        self.sample_amount = 0
        self.total_progress = 0
        self.current_progress = 0
        self.mode = 0
        self.total_runtime = 0
        self.start_time = time()
        self.epoch_number = 1
        self.plyto = plyto_instance

    def on_train_begin(self, logs={}):
        """
        Get number of samples/steps per epoch and total number of epochs
        """
        if "samples" in self.params:
            self.sample_amount = self.params["samples"]
        elif "nb_sample" in self.params:
            self.sample_amount = self.params["nb_sample"]
        else:
            self.sample_amount = self.params["steps"]
            self.mode = 1

        self.epochs = self.params["epochs"]
        self.plyto.update_size(self.sample_amount)
        self.plyto.update_total_steps(self.epochs)

    def on_epoch_begin(self, epoch, logs={}):
        """
        Reset the current epoch's progress every new epoch
        """
        self.current_progress = 0
        self.loss = 0
        self.accuracy = 0

    def on_epoch_end(self, epoch, logs={}):
        self.epoch_number += 1
        self.plyto.update_current_step(self.epoch_number)

    def on_batch_end(self, batch, logs={}):
        """
        Update statistics and datasets
        """
        if self.mode == 0:
            self.current_progress += logs.get("size")
            self.total_progress += logs.get("size")
        else:
            self.current_progress += 1
            self.total_progress += 1
        self.loss = logs.get("loss")
        loss_item = {"samples": self.total_progress, "loss": self.loss}
        self.accuracy = logs.get("acc")
        accuracy_item = {"samples": self.total_progress, "accuracy": self.accuracy}
        self.total_runtime = time() - self.start_time
        self.update_data(loss_item, accuracy_item)

    def update_data(self, loss_item, accuracy_item):
        self.plyto.update_runtime(self.total_runtime)
        self.plyto.update_current_progress(self.current_progress)
        self.plyto.update_total_progress(self.total_progress)
        self.plyto.update_data_set(
            {
                "samples": self.total_progress,
                "loss": self.loss,
                "accuracy": self.accuracy,
            }
        )
        if self.total_progress % 256 == 0 or self.total_progress == (
            self.epochs * self.sample_amount
        ):
            self.plyto.send_data()
