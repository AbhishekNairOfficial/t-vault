/** *******************************************************************************
*  Copyright 2020 T-Mobile, US
*
*  Licensed under the Apache License, Version 2.0 (the "License");
*  you may not use this file except in compliance with the License.
*  You may obtain a copy of the License at
*
*     http://www.apache.org/licenses/LICENSE-2.0
*
*  Unless required by applicable law or agreed to in writing, software
*  distributed under the License is distributed on an "AS IS" BASIS,
*  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*  See the License for the specific language governing permissions and
*  limitations under the License.
*  See the readme.txt file for additional language around disclaimer of warranties.
*********************************************************************************** */
package com.tmobile.cso.vault.api.model;

import java.io.Serializable;
import org.hibernate.validator.constraints.NotBlank;
import io.swagger.annotations.ApiModelProperty;

public class CertificateAWSRole implements Serializable {

	private static final long serialVersionUID = -582074939901141027L;

	@NotBlank
	private String certificateName;

	@NotBlank
	private String rolename;

	@NotBlank
	private String access;

	@NotBlank
	private String certType;

	public CertificateAWSRole() {
	}

	/**
	 * @param certificateName
	 * @param rolename
	 * @param access
	 * @param certType
	 */
	public CertificateAWSRole(String certificateName, String rolename, String access, String certType) {
		super();
		this.certificateName = certificateName;
		this.rolename = rolename;
		this.access = access;
		this.certType = certType;
	}

	@ApiModelProperty(example = "cert1", position = 1)
	public String getCertificateName() {
		return certificateName.toLowerCase();
	}

	public void setCertificateName(String certificateName) {
		this.certificateName = certificateName;
	}

	@ApiModelProperty(example = "role1", position = 2)
	public String getRolename() {
		return rolename.toLowerCase();
	}

	public void setRolename(String rolename) {
		this.rolename = rolename;
	}

	@ApiModelProperty(example = "read", position = 3)
	public String getAccess() {
		return access.toLowerCase();
	}

	public void setAccess(String access) {
		this.access = access;
	}

	@ApiModelProperty(example = "internal", position = 4)
	public String getCertType() {
		return certType.toLowerCase();
	}

	public void setCertType(String certType) {
		this.certType = certType;
	}
}
