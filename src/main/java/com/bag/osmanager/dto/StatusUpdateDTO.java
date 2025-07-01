package com.bag.osmanager.dto;

import com.bag.osmanager.model.enums.StatusOrdemServico;

public class StatusUpdateDTO {
    private StatusOrdemServico status;
    public StatusOrdemServico getStatus() { return status; }
    public void setStatus(StatusOrdemServico status) { this.status = status; }
}
